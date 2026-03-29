import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserOrganization } from '../../organizations/entities/user-organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.user)
  userOrganizations: UserOrganization[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
