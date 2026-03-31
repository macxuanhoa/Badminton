"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('Starting NestJS server...');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
    app.enableCors();
    await app.listen(3001);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map