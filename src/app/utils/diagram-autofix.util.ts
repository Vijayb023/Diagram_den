export function autofixDiagram(diagram: {
  nodes: { key: string; category?: string }[];
  links: { from: string; to: string }[];
}): {
  fixedDiagram: {
    nodes: { key: string; category?: string }[];
    links: { from: string; to: string }[];
  };
  warnings: string[];
} {
  const { nodes, links } = diagram;
  const nodeMap = new Map(nodes.map((n) => [n.key, n]));
  const linkSet = new Set(links.map((l) => `${l.from}->${l.to}`));
  const warnings: string[] = [];
  const autoLinks: { from: string; to: string }[] = [];

  const hubKey = 'System Hub';
  if (!nodeMap.has(hubKey)) {
    nodes.push({ key: hubKey, category: 'default' });
    warnings.push(`System Hub added to support autofix.`);
  }

  const serviceKeys = nodes.filter(n => n.category === 'service').map(n => n.key);
  const apiKeys = nodes.filter(n => n.category === 'api').map(n => n.key);
  const dbKeys = nodes.filter(n => n.category === 'database').map(n => n.key);
  const queueKeys = nodes.filter(n => n.category === 'queue').map(n => n.key);
  const monitoringKeys = nodes.filter(n => n.category === 'monitoring').map(n => n.key);
  const actorKeys = nodes.filter(n => n.category === 'actor').map(n => n.key);

  // Link APIs to services
  apiKeys.forEach(api => {
    serviceKeys.forEach(service => {
      if (!linkSet.has(`${api}->${service}`)) {
        autoLinks.push({ from: api, to: service });
        linkSet.add(`${api}->${service}`);
      }
    });
  });

  // Link actors to APIs
  actorKeys.forEach(actor => {
    apiKeys.forEach(api => {
      if (!linkSet.has(`${actor}->${api}`)) {
        autoLinks.push({ from: actor, to: api });
        linkSet.add(`${actor}->${api}`);
      }
    });
  });

  // Link services to a DB or Queue if none exist
  serviceKeys.forEach(service => {
    const hasDBLink = links.some(l => l.from === service && dbKeys.includes(l.to));
    const hasQueueLink = links.some(l => l.from === service && queueKeys.includes(l.to));
    const hasAnyLink = links.some(l => l.from === service || l.to === service);

    if (!hasDBLink && dbKeys.length > 0) {
      autoLinks.push({ from: service, to: dbKeys[0] });
      warnings.push(`Service "${service}" auto-linked to DB "${dbKeys[0]}"`);
    }

    if (!hasQueueLink && queueKeys.length > 0) {
      autoLinks.push({ from: service, to: queueKeys[0] });
      warnings.push(`Service "${service}" auto-linked to queue "${queueKeys[0]}"`);
    }

    // Ensure every service has at least one connection
    if (!hasAnyLink) {
      autoLinks.push({ from: service, to: hubKey });
      warnings.push(`Orphan service "${service}" connected to System Hub.`);
    }
  });

  // Link monitoring nodes from services
  monitoringKeys.forEach(mon => {
    serviceKeys.forEach(service => {
      autoLinks.push({ from: service, to: mon });
      linkSet.add(`${service}->${mon}`);
    });
  });

  // Link System Hub to remaining unlinked nodes
  nodes.forEach(n => {
    const isLinked = links.some(l => l.from === n.key || l.to === n.key) ||
                     autoLinks.some(l => l.from === n.key || l.to === n.key);
    if (!isLinked && n.key !== hubKey) {
      autoLinks.push({ from: n.key, to: hubKey });
      warnings.push(`Unlinked node "${n.key}" connected to System Hub.`);
    }
  });

  return {
    fixedDiagram: {
      nodes,
      links: [...links, ...autoLinks],
    },
    warnings,
  };
}
