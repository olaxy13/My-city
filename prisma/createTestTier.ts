import 'dotenv/config';
import { prisma } from '../src/config/prisma';

async function main() {
    console.log('🔍 Searching for an existing event listing...');

    // 1. Automatically find the first event listing in your database
    // const event = await prisma.listing.findFirst({
    //     where: { listingType: 'event' },
    //     include: { eventDetails: true },
    // });
    const event = await prisma.listing.findUnique({
        where: { id: '171312f2-b815-4b04-9acb-7471856172fd' },
        include: { eventDetails: true },
    });

    if (!event) {
        console.error('❌ No event listing found! Please create an event first.');
        return;
    }

    console.log(`📌 Found Event: "${event.title}" (ID: ${event.id})`);

    // 2. Ensure EventDetails has the custom commission setup
    await prisma.eventDetails.upsert({
        where: { listingId: event.id },
        update: {
            commissionType: 'FLAT_FEE',
            commissionValue: 300, // ₦300 flat commission per ticket
        },
        create: {
            listingId: event.id,
            startDateTime: new Date(),
            commissionType: 'FLAT_FEE',
            commissionValue: 300,
        },
    });

    // 3. Create the Test Ticket Tier
    const tier = await prisma.ticketTier.create({
        data: {
            listingId: event.id,
            name: 'Early Bird',
            description: 'Access to main stage and welcome drink',
            price: 5000, // ₦5,000
            totalCapacity: 50,
            soldCount: 0,
        },
    });

    console.log('\n🎉 SUCCESS! Ticket Tier Created:');
    console.log('-------------------------------------------');
    console.log(`Event Title:      ${event.title}`);
    console.log(`Listing ID:       ${event.id}`);
    console.log(`Ticket Tier ID:   ${tier.id}`);
    console.log(`Price:            ₦${tier.price.toLocaleString()}`);
    console.log(`Capacity:         ${tier.totalCapacity} tickets`);
    console.log('-------------------------------------------');
    console.log('\n👉 Copy the Listing ID and Ticket Tier ID above to test the payment endpoint!');
}

main()
    .catch((e) => {
        console.error('Error creating ticket tier:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
