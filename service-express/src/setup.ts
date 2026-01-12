import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { adapt } from "@congruent-stack/congruent-api-express"

import { DIContainer, pokedexApiContract } from '@congruent-stack/example-monorepo-contract';

import { LoggerService } from "./logger_svc.js";
import { PokemonService } from "./pokemon_svc.js";

// service registration
export const container = new DIContainer()
  .register('LoggerSvc', () => new LoggerService(), 'scoped')
  .register('PokemonSvc', (scope) => new PokemonService(scope.getLoggerSvc()), 'scoped') //TODO: don't allow singleton if it has scoped or transient dependencies

// express pipeline setup
export const app = express()
  .use(cors())
  .use(bodyParser.json());

// registry setup
adapt({ expressApp: app, diContainer: container, apiContract: pokedexApiContract });
export const reg = pokedexApiContract.createRegistry<typeof container>();