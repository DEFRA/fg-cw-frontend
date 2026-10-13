import { describe, expect, it } from "vitest";
import { authFailureDetails } from "./auth-failure-details.js";

describe("authFailureDetails", () => {
  const rejection = {
    error: "invalid_client",
    error_description:
      "AADSTS7000222: Secret expired for private-user@example.com",
    error_codes: [7000222],
    correlation_id: "12345678-1234-1234-1234-123456789012",
    access_token: "private-token",
    client_secret: "private-secret",
  };

  it("extracts only diagnostic fields from a Wreck token rejection", () => {
    const details = authFailureDetails({
      data: {
        output: { statusCode: 400 },
        data: {
          payload: Buffer.from(JSON.stringify(rejection)),
          headers: { authorization: "Bearer private-token" },
        },
      },
    });

    expect(details).toEqual({
      statusCode: 400,
      entraError: "invalid_client",
      entraErrorCodes: [7000222],
      correlationId: "12345678-1234-1234-1234-123456789012",
    });
    expect(JSON.stringify(details)).not.toContain("private");
  });

  it("extracts an AADSTS code from a direct response without logging its description", () => {
    const { error_codes: _codes, ...withoutCodes } = rejection;
    expect(authFailureDetails({ data: JSON.stringify(withoutCodes) })).toEqual({
      entraError: "invalid_client",
      entraErrorCodes: [7000222],
      correlationId: "12345678-1234-1234-1234-123456789012",
    });
  });

  it("extracts a transport error code nested under Wreck", () => {
    expect(
      authFailureDetails({
        data: { cause: { code: "CERT_HAS_EXPIRED", message: "private URL" } },
      }),
    ).toEqual({ networkErrorCode: "CERT_HAS_EXPIRED" });
  });

  it.each(["invalid_resource", "new_provider_failure"])(
    "retains an unfamiliar OAuth code: %s",
    (error) => {
      expect(authFailureDetails({ data: { error } })).toEqual({
        entraError: error,
      });
    },
  );

  it.each(["EPIPE", "ERR_TLS_HANDSHAKE_TIMEOUT"])(
    "retains an unfamiliar transport code: %s",
    (code) => {
      expect(authFailureDetails({ data: { cause: { code } } })).toEqual({
        networkErrorCode: code,
      });
    },
  );

  it("accepts symbolic codes up to 64 characters", () => {
    expect(
      authFailureDetails({
        data: { error: "a".repeat(64), code: "E".repeat(64) },
      }),
    ).toEqual({
      entraError: "a".repeat(64),
      networkErrorCode: "E".repeat(64),
    });
  });

  it.each([
    "",
    "a".repeat(65),
    "E".repeat(65),
    "invalid_client\n",
    "ECONNRESET\n",
    "error with spaces",
    "private@example.com",
    "https://example.com/token?secret=private",
    "private-token",
    "1234567890",
    400,
    {},
    null,
  ])("rejects malformed symbolic codes: %j", (value) => {
    expect(authFailureDetails({ data: { error: value, code: value } })).toEqual(
      {},
    );
  });

  it.each([
    undefined,
    {},
    { data: "not JSON" },
    { data: Buffer.from("<html>proxy error</html>") },
  ])("handles missing or malformed error data: %j", (error) => {
    expect(authFailureDetails(error)).toEqual({});
  });

  it("rejects unexpected values in otherwise permitted fields", () => {
    expect(
      authFailureDetails({
        data: {
          error: "private-token",
          error_codes: ["private-secret"],
          correlation_id: "private-email",
          code: "private-secret",
        },
      }),
    ).toEqual({});
  });

  it("handles cyclic underlying errors without failing the callback", () => {
    const underlying = { code: "ECONNRESET" };
    underlying.cause = underlying;
    expect(authFailureDetails({ data: underlying })).toEqual({
      networkErrorCode: "ECONNRESET",
    });
  });
});
