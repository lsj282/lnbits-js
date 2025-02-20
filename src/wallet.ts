 import axios, { AxiosError, AxiosInstance } from 'axios';

interface LNBitsConfig {
  adminKey: string;
  invoiceReadKey: string;
  endpoint?: string;
}

interface WalletDetails {
  id: string;
  name: string;
  balance: number;
}

interface CreateInvoice {
  checking_id: string;
  lnurl_response: string;
  payment_hash: string;
  payment_request: string;
}

interface PayInvoice {
  payment_hash: string;
}

interface CheckInvoice {
  payment_hash: string;
}

interface UrlParse {
    domain: string;
    callback: string;
    maxSendable: number;
    minSendable: number;
    metadata: Array<[string, string]>;
    commentAllowed: number;
    tag: string;
    allowsNostr: boolean;
    nostrPubkey: string;
    kind: string;
    fixed: boolean;
    description_hash: string;
    description: string;
    targetUser: string;
}

interface PayLnUrl {
    success_action : any;
    payment_hash: string;
    checking_id: string;
}

export class LNBitsWalletClass {
  private adminKey = '';
  private invoiceReadKey = '';
  private endpoint = 'https://lnbits.com';
  private api: AxiosInstance;

  constructor(params: LNBitsConfig) {
    this.adminKey = params.adminKey;
    this.invoiceReadKey = params.invoiceReadKey;
    this.endpoint = params.endpoint || this.endpoint;
    this.api = axios.create({
      baseURL: `${this.endpoint}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  walletDetails = async (): Promise<WalletDetails> => {
    this.api.defaults.headers['X-Api-Key'] = this.adminKey;
    return await this.api
      .get(`/wallet`)
      .then((res: { data: WalletDetails }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };

  createInvoice = async (
    params: {
      amount: number;
      memo: string;
      out?: boolean;
      webhook?: string;
      expiry?: number;
    } = {
      amount: 0,
      memo: 'memo',
      out: false,
      webhook: '',
      // no default here because lnbits will use its own default
    }
  ): Promise<CreateInvoice> => {
    this.api.defaults.headers['X-Api-Key'] = this.invoiceReadKey;
    // lnbits does not like empty values
    params['webhook']==='' && delete params['webhook'];
    return await this.api
      .post(`/payments`, params)
      .then((res: { data: CreateInvoice }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };

  payInvoice = async (
    params: {
      bolt11: string;
      out: boolean;
    } = {
      bolt11: '',
      out: true,
    }
  ): Promise<PayInvoice> => {
    this.api.defaults.headers['X-Api-Key'] = this.adminKey;
    return await this.api
      .post(`/payments`, params)
      .then((res: { data: PayInvoice }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };

  payLnUrl = async (
    params: {
      callback: string;
      description_hash: string;
      amount: number;
      comment: string;
      description: string;
    }
  ): Promise<PayLnUrl> => {
    this.api.defaults.headers['X-Api-Key'] = this.adminKey;
    return await this.api
      .post(`/payments/lnurl`, params)
      .then((res: { data: PayLnUrl }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };

  checkInvoice = async (params: {
    payment_hash: string;
  }): Promise<CheckInvoice> => {
    this.api.defaults.headers['X-Api-Key'] = this.invoiceReadKey;
    return await this.api
      .get(`/payments/${params.payment_hash}`)
      .then((res: { data: CheckInvoice }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };

  parseUrl = async (params: {
    nsUrl: string;
  }): Promise<UrlParse> => {
    this.api.defaults.headers['X-Api-Key'] = this.invoiceReadKey;
    return await this.api
      .get(`/lnurlscan/${params.nsUrl}`)
      .then((res: { data: UrlParse }) => {
        return res.data;
      })
      .catch((err: AxiosError) => {
        throw err;
      });
  };
}
