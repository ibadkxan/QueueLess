export default function ServiceCard({ service, onBook, canBook }) {
  return (
    <article className="service-card">
      <div className="service-top"><span className="pill">{service.category || 'General'}</span><span className="duration">~{service.averageMinutes} min</span></div>
      <h3>{service.name}</h3>
      <p className="muted">{service.description || 'Service details provided by the enterprise.'}</p>
      <div className="service-meta"><span>⌂ {service.enterpriseName}</span>{service.location && <span>⌖ {service.location}</span>}</div>
      {canBook && <button className="button primary full" onClick={() => onBook(service)}>Get a token</button>}
    </article>
  );
}
