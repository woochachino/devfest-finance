// Renders a Lucide icon by name. Used for stocks and article avatars.

import {
    Zap,
    Cpu,
    Monitor,
    Globe,
    Building2,
    TrendingUp,
    Syringe,
    Landmark,
    Briefcase,
    Award,
    Apple,
    Pill,
    Gem,
    Factory,
    Fuel,
    Package,
    Shield,
    Store,
    Crosshair,
    Car,
    ShoppingCart,
    ScanSearch,
    FlaskConical,
    AlertTriangle,
    TrendingDown,
    BarChart2,
} from 'lucide-react';

const iconMap = {
    Zap,
    Cpu,
    Monitor,
    Globe,
    Building2,
    TrendingUp,
    TrendingDown,
    Syringe,
    Landmark,
    Briefcase,
    Award,
    Apple,
    Pill,
    Gem,
    Factory,
    Fuel,
    Package,
    Shield,
    Store,
    Crosshair,
    Car,
    ShoppingCart,
    ScanSearch,
    FlaskConical,
    AlertTriangle,
    BarChart2,
};

export default function StockIcon({ name, className = 'w-5 h-5', ...props }) {
    const Icon = iconMap[name] || BarChart2;
    return <Icon className={className} {...props} />;
}
