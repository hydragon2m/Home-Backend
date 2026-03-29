import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvitationsTable1774794349537 implements MigrationInterface {
    name = 'AddInvitationsTable1774794349537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_role_enum" AS ENUM('ORG_ADMIN', 'ORG_MEMBER')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "role" "public"."invitations_role_enum" NOT NULL DEFAULT 'ORG_MEMBER', "expiresAt" TIMESTAMP, "maxUses" integer NOT NULL DEFAULT '1', "usesCount" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "organization_id" uuid NOT NULL, "invited_by_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dfcfae6af22931048ef73078418" UNIQUE ("code"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dfcfae6af22931048ef7307841" ON "invitations" ("code") `);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_d4de0403dd012cf87b430af70ef" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_d4de0403dd012cf87b430af70ef"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_42d1dbb4d85dc3643fdc6560af0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dfcfae6af22931048ef7307841"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_role_enum"`);
    }

}
