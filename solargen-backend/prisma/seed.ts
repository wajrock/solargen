import {PrismaMariaDb} from '@prisma/adapter-mariadb';
import {PrismaClient} from '@prisma/client';
import axios from 'axios';
import {FastApiInstallationResponse, FastApiModelInfo} from '../src/types/fastapi.types';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL_RUNTIME!);
const prisma = new PrismaClient({adapter});
const API = process.env.FASTAPI_URL;
const HEADERS = {'X-API-Key': process.env.FASTAPI_KEY};

async function seedInstallation() {
    const {data} = await axios.get<FastApiInstallationResponse>(`${API}/installation`, {headers: HEADERS});

    let installation = await prisma.installation.findFirst();
    if (!installation) {
        installation = await prisma.installation.create({
            data: {
                name: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
            },
        });
        console.log('Installation seeded');
    }

    for (const site of data.sites) {
        await prisma.site.upsert({
            where: {id: site.id},
            update: {},
            create: {
                id: site.id,
                kwp: site.kwp,
                panel_count: site.panel_count,
                panel_model: site.panel_model,
                inverter_model: site.inverter_model,
                installation_id: installation.id,
            },
        });
    }

    console.log('Sites seeded');
}

async function seedModelInfo() {
    const existing = await prisma.modelInfo.findFirst();
    if (existing) {
        console.log('Model info already seeded');
        return;
    }

    const {data} = await axios.get<FastApiModelInfo>(`${API}/model-infos`, {headers: HEADERS});

    await prisma.modelInfo.create({
        data: {
            ...data,
            fetched_at: new Date(),
        },
    });

    console.log('Model info seeded');
}

async function main() {
    await seedInstallation();
    await seedModelInfo();
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
