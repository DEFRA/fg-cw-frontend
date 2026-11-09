// @vitest-environment node
import { execFile, execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const runNode = promisify(execFile);
const certificateHost = "test.example.com";
const childScript = `
  await import('./src/common/proxy.js');
  const { default: Wreck } = await import('@hapi/wreck');
  try {
    const { res } = await Wreck.post(process.env.TEST_TOKEN_ENDPOINT, {
      payload: 'grant_type=authorization_code',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      timeout: 2000,
    });
    console.log(JSON.stringify({ statusCode: res.statusCode }));
  } catch (error) {
    console.log(JSON.stringify({ code: error.data?.code ?? error.code }));
  }
`;

const fetchScript = `
  await import('./src/common/proxy.js');
  try {
    const response = await fetch(process.env.TEST_TOKEN_ENDPOINT);
    console.log(JSON.stringify({ statusCode: response.status }));
  } catch (error) {
    console.log(JSON.stringify({ message: error.message }));
  }
`;

// The real proxy bootstrap runs in a child process so its global agents do
// not affect other tests. All endpoints and certificates are local fixtures.
describe("HTTPS token exchange through the configured HTTP proxy", () => {
  let directory;
  let tokenServer;
  let directServer;
  let proxy;
  let proxiedRequests = 0;
  let receivedServerName;
  const sockets = new Set();

  beforeAll(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), "cw-proxy-tls-"));
    execFileSync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        path.join(directory, "key.pem"),
        "-out",
        path.join(directory, "cert.pem"),
        "-days",
        "1",
        "-subj",
        `/CN=${certificateHost}`,
        "-addext",
        `subjectAltName=DNS:${certificateHost}`,
      ],
      { stdio: "ignore" },
    );
    tokenServer = https.createServer(
      {
        key: await readFile(path.join(directory, "key.pem")),
        cert: await readFile(path.join(directory, "cert.pem")),
      },
      (_request, response) => response.end("fixture token response"),
    );
    tokenServer.on("secureConnection", (socket) => {
      receivedServerName = socket.servername;
    });
    await new Promise((resolve) => tokenServer.listen(0, "127.0.0.1", resolve));
    directServer = http.createServer((_request, response) =>
      response.end("fixture direct response"),
    );
    await new Promise((resolve) =>
      directServer.listen(0, "127.0.0.1", resolve),
    );
    proxy = http.createServer((_request, response) => {
      proxiedRequests += 1;
      response.statusCode = 502;
      response.end();
    });
    proxy.on("connect", (_request, client, head) => {
      proxiedRequests += 1;
      const upstream = net.connect(
        tokenServer.address().port,
        "127.0.0.1",
        () => {
          client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
          upstream.write(head);
          client.pipe(upstream);
          upstream.pipe(client);
        },
      );
      sockets.add(client);
      sockets.add(upstream);
      client.on("error", () => upstream.destroy());
      upstream.on("error", () => client.destroy());
      client.on("close", () => {
        upstream.destroy();
        sockets.delete(client);
        sockets.delete(upstream);
      });
    });
    await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  });

  afterAll(async () => {
    for (const socket of sockets) {
      socket.destroy();
    }
    await Promise.all([
      new Promise((resolve) => proxy?.close(resolve)),
      new Promise((resolve) => tokenServer?.close(resolve)),
      new Promise((resolve) => directServer?.close(resolve)),
    ]);
    await rm(directory, { recursive: true, force: true });
  });

  const exchangeToken = async (
    hostname,
    script = childScript,
    extraEnv = {},
  ) => {
    const { stdout } = await runNode(
      process.execPath,
      ["--input-type=module", "-e", script],
      {
        env: {
          ...process.env,
          HTTP_PROXY: `http://127.0.0.1:${proxy.address().port}`,
          GLOBAL_AGENT_NO_PROXY: "",
          NO_PROXY: "",
          NODE_EXTRA_CA_CERTS: path.join(directory, "cert.pem"),
          TEST_TOKEN_ENDPOINT: `https://${hostname}:${tokenServer.address().port}/token`,
          ...extraEnv,
        },
        timeout: 5000,
      },
    );
    return JSON.parse(stdout);
  };

  it("exchanges a token with the destination hostname verified and sent as SNI", async () => {
    expect(await exchangeToken(certificateHost)).toEqual({ statusCode: 200 });
    expect(receivedServerName).toBe(certificateHost);
  });

  it("sends native fetch through the proxy as well", async () => {
    expect(await exchangeToken(certificateHost, fetchScript)).toEqual({
      statusCode: 200,
    });
    expect(receivedServerName).toBe(certificateHost);
  });

  it("lets native fetch reach a NO_PROXY destination directly", async () => {
    const directUrl = `http://127.0.0.1:${directServer.address().port}/`;
    const before = proxiedRequests;

    expect(
      await exchangeToken("unused", fetchScript, {
        NO_PROXY: "127.0.0.1",
        TEST_TOKEN_ENDPOINT: directUrl,
      }),
    ).toEqual({ statusCode: 200 });
    expect(proxiedRequests).toBe(before);
  });

  it("still proxies native fetch to a destination outside NO_PROXY", async () => {
    const directUrl = `http://127.0.0.1:${directServer.address().port}/`;
    const before = proxiedRequests;

    // The fixture proxy only tunnels to the HTTPS server, so the request
    // fails; what matters is that it was sent to the proxy at all.
    await exchangeToken("unused", fetchScript, {
      TEST_TOKEN_ENDPOINT: directUrl,
    });
    expect(proxiedRequests).toBeGreaterThan(before);
  });

  it("still rejects a certificate for a different hostname", async () => {
    expect(await exchangeToken("wrong.example.com")).toEqual({
      code: "ERR_TLS_CERT_ALTNAME_INVALID",
    });
  });

  it("preserves a trusted CA for an HTTPS request through the proxy", async () => {
    vi.stubEnv("HTTP_PROXY", `http://127.0.0.1:${proxy.address().port}`);
    vi.stubEnv("GLOBAL_AGENT_NO_PROXY", "");
    try {
      await import("./proxy.js");
      const ca = await readFile(path.join(directory, "cert.pem"));
      const statusCode = await new Promise((resolve, reject) => {
        https
          .get(
            `https://${certificateHost}:${tokenServer.address().port}/token`,
            { ca },
            (response) => {
              response.resume();
              resolve(response.statusCode);
            },
          )
          .on("error", reject);
      });
      expect(statusCode).toBe(200);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
