import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ClaimRepository } from './core/repositories/claim.repository';
import { HttpClaimRepository } from './infrastructure/api/http-claim.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: ClaimRepository, useClass: HttpClaimRepository },
  ],
};
