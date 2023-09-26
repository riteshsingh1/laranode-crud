declare module "npm0crud" {
  import * as React from "react";
  export interface model {
    basename?: string;
    getUserConfirmation?: (
      message: string,
      callback: (ok: boolean) => void
    ) => void;
    forceRefresh?: boolean;
    keyLength?: number;
  }
  export class model {}
}
