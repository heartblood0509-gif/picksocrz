// TossPayments Client Configuration
// Documentation: https://docs.tosspayments.com/reference

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

export interface TossPaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  successUrl: string;
  failUrl: string;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt?: string;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
  };
  virtualAccount?: {
    accountNumber: string;
    bank: string;
    customerName: string;
    dueDate: string;
  };
  transfer?: {
    bank: string;
  };
  easyPay?: {
    provider: string;
    amount: number;
  };
}

// Check if TossPayments is configured
export const isTossConfigured = Boolean(TOSS_CLIENT_KEY);

// Generate unique order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER_${timestamp}_${random}`;
};

// TossPayments SDK v2 types
interface TossPaymentsWidgetInstance {
  renderPaymentMethods: (
    selector: string,
    options: { value: number }
  ) => Promise<PaymentMethodWidget>;
  renderAgreement: (selector: string) => Promise<AgreementWidget>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    customerName?: string;
    customerEmail?: string;
    customerMobilePhone?: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

interface PaymentMethodWidget {
  updateAmount: (amount: number) => void;
}

interface AgreementWidget {
  getAgreementStatus: () => Promise<{ agreedRequiredTerms: boolean }>;
}

// Load TossPayments SDK v2
export const loadTossPaymentsWidget = async (): Promise<TossPaymentsWidgetInstance | null> => {
  if (typeof window === 'undefined') return null;

  // Check if SDK is already loaded
  const win = window as unknown as {
    TossPayments?: (clientKey: string) => {
      widgets: (options: { customerKey: string }) => TossPaymentsWidgetInstance
    }
  };

  if (win.TossPayments) {
    const tossPayments = win.TossPayments(TOSS_CLIENT_KEY);
    // Use anonymous customer key for guest checkout
    return tossPayments.widgets({ customerKey: 'ANONYMOUS' });
  }

  // Load SDK v2 dynamically
  return new Promise<TossPaymentsWidgetInstance | null>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/standard';
    script.onload = () => {
      const loadedWin = window as unknown as {
        TossPayments?: (clientKey: string) => {
          widgets: (options: { customerKey: string }) => TossPaymentsWidgetInstance
        }
      };
      if (loadedWin.TossPayments) {
        const tossPayments = loadedWin.TossPayments(TOSS_CLIENT_KEY);
        resolve(tossPayments.widgets({ customerKey: 'ANONYMOUS' }));
      } else {
        resolve(null);
      }
    };
    script.onerror = () => {
      console.error('Failed to load TossPayments SDK');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// Legacy v1 SDK support for simple payments
interface TossPaymentsV1Instance {
  requestPayment: (method: string, params: {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail?: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

// Load TossPayments SDK v1 (fallback)
export const loadTossPaymentsV1 = async (): Promise<TossPaymentsV1Instance | null> => {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as {
    TossPayments?: new (clientKey: string) => TossPaymentsV1Instance
  };

  // Check if v1 SDK is loaded
  if (win.TossPayments && typeof win.TossPayments === 'function') {
    try {
      return new win.TossPayments(TOSS_CLIENT_KEY);
    } catch {
      // V2 SDK loaded, not v1
    }
  }

  // Load SDK v1 dynamically
  return new Promise<TossPaymentsV1Instance | null>((resolve) => {
    // Remove any existing script
    const existingScript = document.querySelector('script[src*="tosspayments.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.onload = () => {
      const loadedWin = window as unknown as {
        TossPayments?: new (clientKey: string) => TossPaymentsV1Instance
      };
      if (loadedWin.TossPayments) {
        try {
          resolve(new loadedWin.TossPayments(TOSS_CLIENT_KEY));
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
    script.onerror = () => {
      console.error('Failed to load TossPayments SDK');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// Request payment using v1 SDK (simpler, more compatible)
export const requestPayment = async (params: TossPaymentRequest): Promise<void> => {
  if (!isTossConfigured) {
    throw new Error('TossPayments is not configured');
  }

  const tossPayments = await loadTossPaymentsV1();

  if (!tossPayments) {
    throw new Error('Failed to load TossPayments SDK');
  }

  // Use '카드' for card payments - this opens Toss payment window
  // where user can select various payment methods including KakaoPay
  await tossPayments.requestPayment('카드', {
    amount: params.amount,
    orderId: params.orderId,
    orderName: params.orderName,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    successUrl: params.successUrl,
    failUrl: params.failUrl,
  });
};

// Confirm payment on server side
export const confirmPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossPaymentResponse> => {
  const response = await fetch('/api/payments/toss/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Payment confirmation failed');
  }

  return data.payment;
};
