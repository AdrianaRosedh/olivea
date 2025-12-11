// Keep your component
"use client";

export default function NextGenBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 gradient-layer" />

      <style jsx global>{`
        /* 1) Type + default so it animates smoothly */
        @property --scroll-per {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        :root { --scroll-per: 0; }

        .gradient-layer {
          background: linear-gradient(
            to bottom,
            hsl(80, 14%, 92%) 0%,
            hsl(80, 14%, 90%) 50%,
            hsl(80, 14%, 88%) 100%
          );
        }

          /* transition won't do much for gradients—ok to leave or remove */
          transition: background 0.3s ease-out;
          will-change: background;
        }

        /* 2) (Optional) Pure-CSS scroll linkage where supported */
        @supports (animation-timeline: scroll()) {
          @scroll-timeline page { source: auto; }
          .gradient-layer {
            animation: hueProgress 1s linear both;
            animation-timeline: page;
          }
          @keyframes hueProgress {
            from { --scroll-per: 0; }
            to   { --scroll-per: 1; }
          }
        }
      `}</style>
    </div>
  );
}
