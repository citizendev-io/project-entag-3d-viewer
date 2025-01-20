
// Imports
import * as R0M0 from "@api/root/src/api/autodesk/upload/route.ts";
import * as R0M1 from "@api/root/src/api/bubble-trigger/index.ts";
import * as configure from "@api/configure";

export const routeBase = "/api";

const internal  = [
  R0M0.default && {
        source     : "src/api/autodesk/upload/route.ts?fn=default",
        method     : "use",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.default,
      },
  R0M0.GET && {
        source     : "src/api/autodesk/upload/route.ts?fn=GET",
        method     : "get",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.GET,
      },
  R0M0.PUT && {
        source     : "src/api/autodesk/upload/route.ts?fn=PUT",
        method     : "put",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.PUT,
      },
  R0M0.POST && {
        source     : "src/api/autodesk/upload/route.ts?fn=POST",
        method     : "post",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.POST,
      },
  R0M0.PATCH && {
        source     : "src/api/autodesk/upload/route.ts?fn=PATCH",
        method     : "patch",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.PATCH,
      },
  R0M0.DELETE && {
        source     : "src/api/autodesk/upload/route.ts?fn=DELETE",
        method     : "delete",
        route      : "/autodesk/upload/route",
        path       : "/api/autodesk/upload/route",
        url        : "/api/autodesk/upload/route",
        cb         : R0M0.DELETE,
      },
  R0M1.default && {
        source     : "src/api/bubble-trigger/index.ts?fn=default",
        method     : "use",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.default,
      },
  R0M1.GET && {
        source     : "src/api/bubble-trigger/index.ts?fn=GET",
        method     : "get",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.GET,
      },
  R0M1.PUT && {
        source     : "src/api/bubble-trigger/index.ts?fn=PUT",
        method     : "put",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.PUT,
      },
  R0M1.POST && {
        source     : "src/api/bubble-trigger/index.ts?fn=POST",
        method     : "post",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.POST,
      },
  R0M1.PATCH && {
        source     : "src/api/bubble-trigger/index.ts?fn=PATCH",
        method     : "patch",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.PATCH,
      },
  R0M1.DELETE && {
        source     : "src/api/bubble-trigger/index.ts?fn=DELETE",
        method     : "delete",
        route      : "/bubble-trigger/",
        path       : "/api/bubble-trigger/",
        url        : "/api/bubble-trigger/",
        cb         : R0M1.DELETE,
      }
].filter(it => it);

export const routers = internal.map((it) => {
  const { method, path, route, url, source } = it;
  return { method, url, path, route, source };
});

export const endpoints = internal.map(
  (it) => it.method?.toUpperCase() + "\t" + it.url
);

export const applyRouters = (applyRouter) => {
  internal.forEach((it) => {
    it.cb = configure.callbackBefore?.(it.cb, it) || it.cb;
    applyRouter(it);
  });
};

