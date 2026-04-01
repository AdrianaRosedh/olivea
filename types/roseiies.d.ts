// Type declarations for the Roseiies web component
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "roseiies-map": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          workplace?: string;
          area?: string;
          "api-base"?: string;
          interactive?: string;
          background?: string;
          radius?: string;
        },
        HTMLElement
      >;
    }
  }
}
