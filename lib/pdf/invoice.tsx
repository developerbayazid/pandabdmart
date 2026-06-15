import {
    Document,
    Page,
    Text,
    View,
} from '@react-pdf/renderer';
import type { Order } from '@/types/order';

const formatCurrency = (amount: number): string => {
    return `\u09F3 ${amount.toLocaleString('en-BD')}`;
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const styles = {
    page: {
        padding: 32,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#0a0a0a',
    },
    header: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid' as const,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 700 as const,
    },
    invoiceLabel: {
        fontSize: 14,
        fontWeight: 700 as const,
        marginBottom: 4,
    },
    invoiceMeta: {
        fontSize: 10,
        color: '#6b7280',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700 as const,
        marginBottom: 8,
        marginTop: 16,
    },
    row: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        paddingVertical: 4,
    },
    addressRow: {
        flexDirection: 'row' as const,
        gap: 24,
        marginBottom: 16,
    },
    addressCol: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 10,
        fontWeight: 700 as const,
        marginBottom: 4,
        color: '#6b7280',
    },
    addressValue: {
        fontSize: 10,
        lineHeight: 1.5,
    },
    tableHeader: {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid' as const,
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableHeaderCell: {
        fontSize: 10,
        fontWeight: 700 as const,
        color: '#6b7280',
    },
    tableRow: {
        flexDirection: 'row' as const,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        borderBottomStyle: 'solid' as const,
    },
    tableCell: {
        fontSize: 10,
    },
    totalRow: {
        flexDirection: 'row' as const,
        justifyContent: 'flex-end' as const,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        borderTopStyle: 'solid' as const,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 700 as const,
        marginRight: 8,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 700 as const,
    },
    footer: {
        position: 'absolute' as const,
        bottom: 32,
        left: 32,
        right: 32,
        textAlign: 'center' as const,
        fontSize: 9,
        color: '#9ca3af',
    },
    col1: { width: '50%' },
    col2: { width: '15%', textAlign: 'right' as const },
    col3: { width: '15%', textAlign: 'right' as const },
    col4: { width: '20%', textAlign: 'right' as const },
};

export function InvoicePDF({ order }: { order: Order }) {
    const shipping = order.shipping_addresses[0];
    const payment = order.payments[0];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.storeName}>PandaBDMart</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceLabel}>INVOICE</Text>
                        <Text style={styles.invoiceMeta}>Order #{order.id.slice(0, 8)}</Text>
                        <Text style={styles.invoiceMeta}>{formatDate(order.created_at)}</Text>
                    </View>
                </View>

                <View style={styles.addressRow}>
                    <View style={styles.addressCol}>
                        <Text style={styles.addressLabel}>SHIPPING ADDRESS</Text>
                        {shipping && (
                            <>
                                <Text style={styles.addressValue}>{shipping.name}</Text>
                                <Text style={styles.addressValue}>{shipping.phone}</Text>
                                <Text style={styles.addressValue}>{shipping.address}</Text>
                                <Text style={styles.addressValue}>
                                    {shipping.city}, {shipping.district} {shipping.postal_code}
                                </Text>
                            </>
                        )}
                    </View>
                    <View style={styles.addressCol}>
                        <Text style={styles.addressLabel}>PAYMENT METHOD</Text>
                        <Text style={styles.addressValue}>
                            {order.payment_method === 'sslcommerz'
                                ? 'SSLCommerz'
                                : order.payment_method === 'bkash'
                                  ? 'bKash'
                                  : order.payment_method === 'nagad'
                                    ? 'Nagad'
                                    : 'Cash on Delivery'}
                        </Text>
                        {payment?.txn_id && (
                            <Text style={styles.addressValue}>TxnID: {payment.txn_id}</Text>
                        )}
                        <Text style={{ ...styles.addressValue, marginTop: 12 }}>
                            <Text style={styles.addressLabel}>ORDER STATUS</Text>
                        </Text>
                        <Text style={styles.addressValue}>{order.status}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>ORDER ITEMS</Text>

                <View style={styles.tableHeader}>
                    <Text style={{ ...styles.tableHeaderCell, ...styles.col1 }}>Product</Text>
                    <Text style={{ ...styles.tableHeaderCell, ...styles.col2 }}>Qty</Text>
                    <Text style={{ ...styles.tableHeaderCell, ...styles.col3 }}>Unit Price</Text>
                    <Text style={{ ...styles.tableHeaderCell, ...styles.col4 }}>Total</Text>
                </View>

                {order.order_items.map((item) => {
                    const productName =
                        (item.product_snapshot as Record<string, unknown> | null)?.name ?? 'Product';
                    const variantAttrs =
                        (item.variant_snapshot as Record<string, unknown> | null)?.sku ?? '';

                    return (
                        <View key={item.id} style={styles.tableRow}>
                            <View style={styles.col1}>
                                <Text style={styles.tableCell}>{String(productName)}</Text>
                                {variantAttrs && (
                                    <Text style={{ ...styles.tableCell, color: '#9ca3af', fontSize: 9 }}>
                                        SKU: {String(variantAttrs)}
                                    </Text>
                                )}
                            </View>
                            <Text style={{ ...styles.tableCell, ...styles.col2 }}>
                                {item.quantity}
                            </Text>
                            <Text style={{ ...styles.tableCell, ...styles.col3 }}>
                                {formatCurrency(item.unit_price)}
                            </Text>
                            <Text style={{ ...styles.tableCell, ...styles.col4 }}>
                                {formatCurrency(item.unit_price * item.quantity)}
                            </Text>
                        </View>
                    );
                })}

                <View style={styles.totalRow}>
                    <View>
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Subtotal:</Text>
                            <Text style={styles.tableCell}>
                                {formatCurrency(order.subtotal)}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Shipping:</Text>
                            <Text style={styles.tableCell}>
                                {formatCurrency(order.shipping_cost)}
                            </Text>
                        </View>
                        {order.discount_total > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.totalLabel}>Discount:</Text>
                                <Text style={styles.tableCell}>
                                    -{formatCurrency(order.discount_total)}
                                </Text>
                            </View>
                        )}
                        <View style={{ ...styles.row, marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#e5e7eb', borderTopStyle: 'solid' as const }}>
                            <Text style={{ ...styles.totalLabel, fontSize: 12 }}>Grand Total:</Text>
                            <Text style={{ ...styles.totalValue, fontSize: 12 }}>
                                {formatCurrency(order.grand_total)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Thank you for shopping with PandaBDMart!</Text>
                </View>
            </Page>
        </Document>
    );
}
