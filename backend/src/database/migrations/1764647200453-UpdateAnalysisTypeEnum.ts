import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAnalysisTypeEnum1764647200453 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new enum values to analyses_type_enum
        await queryRunner.query(`
            ALTER TYPE analyses_type_enum ADD VALUE IF NOT EXISTS 'PROJECT_PERFORMANCE';
        `);
        await queryRunner.query(`
            ALTER TYPE analyses_type_enum ADD VALUE IF NOT EXISTS 'ARCHITECTURE_COMPARISON';
        `);
        await queryRunner.query(`
            ALTER TYPE analyses_type_enum ADD VALUE IF NOT EXISTS 'COST_ANALYSIS';
        `);
        await queryRunner.query(`
            ALTER TYPE analyses_type_enum ADD VALUE IF NOT EXISTS 'SECURITY_ANALYSIS';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values directly
        // You would need to recreate the enum type if you need to remove values
        console.log('Cannot remove enum values in PostgreSQL - manual intervention required');
    }

}
