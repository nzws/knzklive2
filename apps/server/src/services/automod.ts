import { CommentAutoModCache } from './redis/comment-auto-mod';

export class AutoModService {
  private redis: CommentAutoModCache;

  constructor(tenantId: number) {
    this.redis = new CommentAutoModCache(tenantId);
  }

  public async shouldHidden(
    acct: string | undefined,
    displayName: string | undefined,
    content: string
  ): Promise<boolean> {
    const rules = (await this.redis.get()).map(rule => ({
      ...rule,
      value: rule.value.toLowerCase()
    }));
    const account = acct?.toLowerCase();
    const domain = account?.split('@')[1];
    const data = ((displayName || '') + content).toLowerCase();

    return rules.some(rule => {
      if (rule.type === 'Account' && account) {
        return rule.value === account;
      } else if (rule.type === 'Domain' && domain) {
        return domain.endsWith(rule.value);
      } else if (rule.type === 'Text') {
        return data.includes(rule.value);
      }

      return false;
    });
  }
}
