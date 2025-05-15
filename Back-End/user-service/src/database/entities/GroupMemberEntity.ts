import { Entity, PrimaryColumn,JoinColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { Group } from "./GroupEntity";  // Assuming Group entity is in the same directory
import { User } from "./UserEntity";    // Assuming User entity is in the same directory

@Entity("groupmember")
export class GroupMember {
  @PrimaryColumn()
  group_id: number;

  @PrimaryColumn({ type: "varchar", length: 100 })
  user_phone: string;

  @Column({ type: "enum", enum: ["member", "admin", "owner"], default: "member" })
  role: "member" | "admin" | "owner";

  @CreateDateColumn({ type: "datetime", precision: 3, nullable: true, default: () => "CURRENT_TIMESTAMP(3)" })
  joined_at: Date;

  @Column({ type: "boolean", default: true })
  status: boolean;

  // Correct the ManyToOne relation
  @ManyToOne(() => Group, group => group.members) // Assuming you have a 'members' field in Group entity
  @JoinColumn({ name: "group_id" }) // Reference the correct column
  group: Group;

  @ManyToOne(() => User, user => user.phone)
  @JoinColumn({ name: "user_phone" }) // Reference the correct column
  user: User;
}
