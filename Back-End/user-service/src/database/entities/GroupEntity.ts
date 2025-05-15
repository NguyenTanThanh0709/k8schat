import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { GroupMember } from "./GroupMemberEntity";  // Assuming User entity is in the same directory

@Entity("group")
export class Group {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100 })
  owner_phone: string;

  @CreateDateColumn({ type: "datetime", precision: 3, nullable: true, default: () => "CURRENT_TIMESTAMP(3)" })
  created_at: Date;

    // Many-to-one relation to GroupMember (assuming one group has many members)
    @OneToMany(() => GroupMember, groupMember => groupMember.group)
    members: GroupMember[];
}
