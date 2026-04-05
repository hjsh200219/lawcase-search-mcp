/**
 * 수출입은행 REST API 라우트 (/exim/*)
 */

import type { Router } from "express";
import { handle } from "./route-helpers.js";
import { getMarketExchangeRates } from "../exim-api.js";

export function registerEximRoutes(router: Router, eximKey: string): void {
  router.get("/exim/exchange-rate", handle(async (req) => {
    const date = req.query.date ? String(req.query.date) : undefined;
    const result = await getMarketExchangeRates(eximKey, date);
    return result.rates;
  }));
}
