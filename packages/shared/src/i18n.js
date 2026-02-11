"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nResources = void 0;
const en_json_1 = __importDefault(require("./i18n/en.json"));
const es_json_1 = __importDefault(require("./i18n/es.json"));
exports.i18nResources = {
    en: { translation: en_json_1.default },
    es: { translation: es_json_1.default },
};
