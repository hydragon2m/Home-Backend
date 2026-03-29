import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Role } from '../users/entities/user.entity';

export enum Action {
  Manage = 'manage', // Any action
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === Role.ADMIN) {
      can(Action.Manage, 'all'); // Admin có full quyền
    } else {
      can(Action.Read, 'all'); // User mặc định được xem all
      // User được update chính tài khoản của bản thân
      can(Action.Update, User, { id: user.id });
      can(Action.Delete, User, { id: user.id });
    }

    return build({
      // Giúp CASL nhận diện instance thuộc entity nào (để parse InferSubjects)
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
