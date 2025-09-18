import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("libraries/*", "routes/libraries.$.tsx"),
  route("second-navigation", "routes/second-navigation.tsx"),
  route("content-library/*", "routes/content-library.$.tsx")
] satisfies RouteConfig;
