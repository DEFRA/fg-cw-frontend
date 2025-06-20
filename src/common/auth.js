import Bell from "@hapi/bell";
import Cookie from "@hapi/cookie";
import { config } from "./config.js";
import { jwtDecode } from "jwt-decode";
import { wreck } from "./wreck.js";
import fetch from "node-fetch";

export const auth = {
  plugin: {
    name: "auth",
    async register(server) {
      if (!config.get("auth.enabled")) {
        server.logger.warn("Authentication is disabled");
        return;
      }
      await server.register([Bell, Cookie]);

      server.auth.strategy("session", "cookie", {
        cookie: {
          name: "session-auth",
          password: config.get("session.cookie.password"),
          ttl: config.get("session.cookie.ttl"),
          path: "/",
          isSecure: config.get("session.cookie.secure"),
          isSameSite: "Strict",
        },
        keepAlive: true,
        appendNext: true,
        redirectTo: "/login",
        validate: async (_request, session) => {
          console.log("SESSION VALIDATE: ", {session}, _request.route.path)
          if (!session || !session.profile) {
            return { isValid: false };
          }

          return { isValid: true, credentials: session };
        },
      });

      server.auth.strategy('msEntraId', 'bell', {
        // provider: {
          // provider: 'azure',
          // protocol: "oauth2",
          // profile: async (credentials, params, get) => {
          //   const me = await get("/me/profile/")
  
          //   console.log("Me", me)
          // },
        // },

        provider: {
          protocol: 'oauth2',
          useParamsAuth: true,
          auth: 'https://login.microsoftonline.com/770a2450-0227-4c62-90c7-4e38537f1102/oauth2/v2.0/authorize',
          token: 'https://login.microsoftonline.com/770a2450-0227-4c62-90c7-4e38537f1102/oauth2/v2.0/token',
          scope: [ 'openid', 'offline_access', 'profile', 'user.read' ],
          profile: async (credentials,params, get) => {
            console.log("get profile", {credentials, params, get})

            try {
              const profile = await fetch('https://graph.microsoft.com/v1.0/me', { 
                headers: {
                  authorization: "Bearer " + params.access_token
                }
              }).then(r => r.json());
              credentials.profile = profile;
              credentials.id_token = params.id_token
            } catch (err) {
              console.error('Error fetching profile:', err);
              throw err;
            }
          }
        },

        password: config.get('session.cookie.password'),
        clientId: config.get('auth.msEntraId.clientId'),
        clientSecret: config.get('auth.msEntraId.clientSecret'),
        scope: ['openid', 'profile', 'email', 'offline_access', 'user.read'],
        config: {
          tenant: config.get('auth.msEntraId.tenantId')
        },
        location(request) {
          return `${config.get("isProduction") ? "https://" : "http://"}${request.info.host}/login/callback`;
        },
        isSecure: config.get('isProduction')
      })

      // server.auth.default("session")

      // Logout
      server.route({
        method: "GET",
        path: "/logout",
        options: { auth: false },
        handler: (request, h) => {
          request.cookieAuth.clear();
          return h.redirect("/");
        },
      });

      // Login - uses ms entra strategy
      server.route({
        method: "GET",
        path: "/login",
        options: {
          auth: {
            mode: "required",
            strategy: "msEntraId",
          },
        },
        handler: (request) => {
          console.log("LOGIN", request.auth)
          /**
           *  The app never get's here...
           *  This is a vanity url to direct user to login.
           *  Default behaviour is to redirect to MS login.
           *  On authentication the user is redirected to /login/callback
           **/
        },
      });

      // callback for login
      server.route({
        method: ["GET"],
        path: "/login/callback",
        options: {
          auth: {
            mode: "try",
            strategy: "msEntraId",
          },
          handler: async function (request, h) {
            console.log("CALLBACK", request.auth)

            console.log(JSON.stringify(request.auth, null, 2))

            // try redirect to original destination
            const next = request?.auth?.credentials?.query?.next;
            console.log({next})
            
            console.log('Authenticated:', JSON.stringify(request.auth, null, 2))
            
            const roles = jwtDecode(request.auth.artifacts.id_token).roles

            request.cookieAuth?.set({
              profile: request.auth.credentials.profile,
              token: request.auth.credentials.token,
              authenticated: request.auth.isAuthenticated,
              authorised: roles.includes('FCP.Casework.Read')
            });

            if (next) {
              return h.redirect(next);
            }

            return h.redirect("/");
          },
        },
      });
    },
  },
};
