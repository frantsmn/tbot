// Mts
interface Account {
    login: string;
    password: string;
    balance: string;
    minutes: string;
    traffic: string;
    spent: string;
    timestamp: number;
    isLowBalance: boolean;
    users: Array<number>;
}

interface AccountStatus {
    balance: string;
    traffic: string;
    minutes: string;
    spent: string;
}
