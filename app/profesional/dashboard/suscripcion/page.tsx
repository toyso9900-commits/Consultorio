"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { activateSubscription } from "../suscripcion/actions";
import { useI18n } from "@/lib/i18n/client";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
  cta: string;
}

export default function ProfessionalSubscriptionPage() {
  const { dictionary } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const PLANS: Plan[] = [
    {
      id: "free",
      name: dictionary.subscription.freePlanName,
      price: 0,
      period: dictionary.subscription.freePlanPeriod,
      description: dictionary.subscription.freePlanDescription,
      features: dictionary.subscription.freeFeatures,
      cta: dictionary.subscription.freePlanCta,
    },
    {
      id: "premium",
      name: dictionary.subscription.premiumPlanName,
      price: 299,
      period: dictionary.subscription.premiumPlanPeriod,
      description: dictionary.subscription.premiumPlanDescription,
      features: dictionary.subscription.premiumFeatures,
      highlighted: true,
      cta: dictionary.subscription.premiumPlanCta,
    },
    {
      id: "pro",
      name: dictionary.subscription.proPlanName,
      price: 2499,
      period: dictionary.subscription.proPlanPeriod,
      description: dictionary.subscription.proPlanDescription,
      features: dictionary.subscription.proFeatures,
      cta: dictionary.subscription.proPlanCta,
    },
  ];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.replace("/profesional/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || session?.user?.role === "ADMIN") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  async function handleSubscribe(planId: string) {
    if (planId === "free" || !session?.user?.id) return;

    setIsProcessing(planId);

    const result = await activateSubscription(session.user.id, planId);

    setIsProcessing(null);

    if (result.success) {
      toast.success(dictionary.subscription.paymentSuccess, {
        description: dictionary.subscription.subscriptionConfirmation.replace(
          "{plan}",
          PLANS.find((p) => p.id === planId)?.name ?? ""
        ),
      });
    } else {
      toast.error(result.error || dictionary.subscription.paymentError);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950">
            <Crown className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {dictionary.subscription.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {dictionary.subscription.subtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <CreditCard className="h-4 w-4" />
          {dictionary.subscription.testMode}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
              plan.highlighted
                ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {dictionary.subscription.mostPopular}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                ${plan.price}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {" "}
                {plan.period}
              </span>
            </div>

            <ul className="mb-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={isProcessing === plan.id || plan.id === "free"}
              className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                plan.highlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {isProcessing === plan.id
                ? dictionary.subscription.processing
                : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {dictionary.subscription.paymentSimulatorTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {dictionary.subscription.paymentSimulatorDescription}
        </p>
      </div>
    </div>
  );
}
