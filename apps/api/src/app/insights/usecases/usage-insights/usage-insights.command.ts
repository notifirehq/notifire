export class UsageInsightsCommand {
  organizationId?: string;

  constructor(data: { organizationId?: string } = {}) {
    this.organizationId = data.organizationId;
  }
}
