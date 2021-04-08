import {Env} from "@tsed/core";
import {Configuration, Inject} from "@tsed/di";
import {$log, PlatformApplication} from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import express from "express";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/typeorm";
import typeormConfig from "./config/typeorm";


export const rootDir = __dirname;
export const isProduction = process.env.NODE_ENV === Env.PROD;

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json"
    }
  });
}

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  logger: {
    disableRoutesSummary: isProduction
  },
  mount: {
    "/rest": [
      `${rootDir}/controllers/**/*.ts`
    ]
  },
  typeorm: typeormConfig,
  exclude: [
    "**/*.spec.ts"
  ],
  // ajv: {
  //   strict: false,
  //   allErrors: true,
  //   $data: true
  // }
  ajv: {
    errorFormatter: (error) => `value '${error.data}' ${error.message}`,
    verbose: false,
    allErrors: true
    // verbose: true
 }
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {
    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(express.json())
      .use(express.urlencoded({
        extended: true
      }));
  }
}
