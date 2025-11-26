import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { RoleEntity } from '../../auth/entities';
import { AbstractEntity } from '../../../database';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  lastUpdatePasswordAt: number;

  @Exclude()
  @Column({ nullable: true, default: true })
  isActive: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    nullable: true,
  })
  role?: RoleEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy?: UserEntity;
}
