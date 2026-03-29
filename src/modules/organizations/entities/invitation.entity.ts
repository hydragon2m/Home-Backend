import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../../users/entities/user.entity';
import { OrgRole } from './user-organization.entity';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column({
    type: 'enum',
    enum: OrgRole,
    default: OrgRole.ORG_MEMBER,
  })
  role: OrgRole;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 1 })
  maxUses: number;

  @Column({ default: 0 })
  usesCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'invited_by_id' })
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by_id' })
  invitedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
