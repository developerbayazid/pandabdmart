import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf/invoice';
import type { Order } from '@/types/order';

export async function renderInvoiceBuffer(order: Order): Promise<Buffer> {
    const buffer = await renderToBuffer(<InvoicePDF order={order} />);
    return Buffer.from(buffer);
}
