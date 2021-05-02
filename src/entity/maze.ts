import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import {
    Position,
    positionPointArrayTransformer,
    positionPointTransformer,
} from "../types";
import { Score } from "./score";

@Entity()
export class Maze extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({ unique: true })
    name: string;

    @Column()
    nColumns: number;

    @Column()
    nLines: number;

    @Column("point", {
        transformer: positionPointTransformer,
    })
    playerPosition: Position;

    @Column("point", {
        array: true,
        transformer: positionPointArrayTransformer,
    })
    robotPositions: Position[];

    @Column("boolean", { array: true, default: [] })
    fences: boolean[];

    @OneToMany((_) => Score, (score) => score.maze, {
        cascade: true,
        eager: true,
    })
    scores: Score[];
}
