import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="text-3xl md:text-4xl font-medium tracking-tight" {...props} />
  ),
  h2: (props) => <h2 className="text-2xl md:text-3xl font-medium mt-10" {...props} />,
  h3: (props) => <h3 className="text-xl md:text-2xl font-medium mt-8" {...props} />,
  p: (props) => <p className="leading-7 text-[15px] md:text-[16px] mt-4" {...props} />,
  a: (props) => <a className="underline underline-offset-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mt-4 space-y-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mt-4 space-y-2" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 pl-4 italic opacity-90" {...props} />
  ),
  hr: () => <hr className="my-10 opacity-20" />,
};
