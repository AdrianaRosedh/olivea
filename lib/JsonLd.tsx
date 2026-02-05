export default function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}


