import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../database';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity({ name: 'tokens' })
export class TokenEntity extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => ProjectEntity, (project) => project.token)
  projects?: ProjectEntity[];
}
