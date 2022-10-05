import { deserializeBorsh, getGovernanceSchemaForAccount, GovernanceAccountType, Realm } from '@solana/spl-governance';

export class RealmV2Serializer {
    deserialize(buffer: Buffer): Realm {
        try {
          return deserializeBorsh(getGovernanceSchemaForAccount(GovernanceAccountType.RealmV2), Realm, buffer) as Realm;
        } catch (e) {
          throw e;
        }
    }
}