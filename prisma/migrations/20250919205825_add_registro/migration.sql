-- CreateTable
CREATE TABLE "public"."Registro" (
    "id" SERIAL NOT NULL,
    "fecha" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);
