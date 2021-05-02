import { BaseEntity, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Score } from "./score";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @OneToMany((_) => Score, (score) => score.user)
    scores: Score[];
}
