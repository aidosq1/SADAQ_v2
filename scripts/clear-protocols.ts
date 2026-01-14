import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление всех протоколов из таблицы Protocol...\n');

  try {
    // Сначала покажем что будет удалено
    const protocols = await prisma.protocol.findMany({
      select: {
        id: true,
        title: true,
        year: true,
      },
    });

    console.log(`Найдено протоколов: ${protocols.length}\n`);

    if (protocols.length > 0) {
      console.log('Список протоколов для удаления:');
      protocols.forEach((p) => {
        console.log(`  - ID ${p.id}: ${p.title} (${p.year})`);
      });
      console.log('');

      // Удаляем все протоколы
      const result = await prisma.protocol.deleteMany({});

      console.log(`✅ Успешно удалено ${result.count} протоколов\n`);
    } else {
      console.log('ℹ️  Таблица Protocol уже пустая\n');
    }

  } catch (error) {
    console.error('❌ Ошибка при удалении протоколов:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка выполнения скрипта:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
