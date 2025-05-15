import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert } from "typeorm";

@Entity("user")
export class User {
  @PrimaryColumn({ type: "varchar", length: 100 })
  phone: string;

  @Column({ type: "varchar", length: 100 })
  email: string;

  @Column({ type: "text" })
  password_hash: string;

  @Column({ type: "varchar", length: 20, default: "OFFLINE" })
  status: string;

  @Column({ type: "text", nullable: true })
  avatar: string | null;

  @CreateDateColumn({ type: "datetime", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  createdAt: Date;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @BeforeInsert()
  setCreatedAt() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
