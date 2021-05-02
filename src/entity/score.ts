import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Maze } from "./maze";
import { User } from "./user";

@Entity()
export class Score extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne((_) => User, (user) => user.scores, {
        eager: true,
        cascade: true,
    })
    user: User;

    @ManyToOne((_) => Maze, (maze) => maze.scores)
    maze: Maze;

    @Column("interval")
    points: number;
}
