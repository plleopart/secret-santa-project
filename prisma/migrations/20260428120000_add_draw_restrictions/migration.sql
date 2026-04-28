-- CreateTable
CREATE TABLE "draw_restrictions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "giver_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draw_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "draw_restrictions_group_id_giver_id_receiver_id_key" ON "draw_restrictions"("group_id", "giver_id", "receiver_id");

-- CreateIndex
CREATE INDEX "draw_restrictions_group_id_idx" ON "draw_restrictions"("group_id");

-- CreateIndex
CREATE INDEX "draw_restrictions_group_id_giver_id_idx" ON "draw_restrictions"("group_id", "giver_id");

-- AddForeignKey
ALTER TABLE "draw_restrictions" ADD CONSTRAINT "draw_restrictions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_restrictions" ADD CONSTRAINT "draw_restrictions_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "users"("keycloak_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_restrictions" ADD CONSTRAINT "draw_restrictions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("keycloak_id") ON DELETE RESTRICT ON UPDATE CASCADE;
