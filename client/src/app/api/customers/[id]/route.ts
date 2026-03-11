import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        jobs: true,
        quotations: true,
        invoices: true
      }
    });

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address, company, tin, vat, notes } = body;

    // Ensure required fields
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { message: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone.trim(),
        address: address?.trim() || null,
        company: company?.trim() || null,
        tin: tin?.trim() || null,
        vat: vat?.trim() || null,
        notes: notes?.trim() || null
      }
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id }, include: { invoices: { select: { id: true } }, quotations: { select: { id: true } }, jobs: { select: { id: true } } } });
      if (!customer) throw new Error('Customer not found');

      const invoiceIds = customer.invoices.map((i) => i.id);
      const jobIds = customer.jobs.map((j) => j.id);

      await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
      await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
      await tx.quotation.deleteMany({ where: { customerId: id } });
      await tx.expense.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.job.deleteMany({ where: { customerId: id } });
      await tx.customer.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    const message = error?.message || error?.meta?.cause || 'Failed to delete customer. Customer may have related jobs, quotations, or invoices.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
