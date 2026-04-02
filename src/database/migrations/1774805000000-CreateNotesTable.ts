import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateNotesTable1774805000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "notes",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "title",
                    type: "varchar"
                },
                {
                    name: "content",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "is_folder",
                    type: "boolean",
                    default: false
                },
                {
                    name: "parent_id",
                    type: "uuid",
                    isNullable: true
                },
                {
                    name: "org_id",
                    type: "uuid"
                },
                {
                    name: "user_id",
                    type: "uuid"
                },
                {
                    name: "is_pinned",
                    type: "boolean",
                    default: false
                },
                {
                    name: "position",
                    type: "integer",
                    default: 0
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        await queryRunner.createForeignKeys("notes", [
            new TableForeignKey({
                columnNames: ["parent_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "notes",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["org_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "organizations",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("notes");
    }

}
