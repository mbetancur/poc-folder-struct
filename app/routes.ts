import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("content-library/*", "routes/content-library.$.tsx")
] satisfies RouteConfig;
