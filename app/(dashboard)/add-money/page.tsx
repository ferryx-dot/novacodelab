import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, MessageCircle, CreditCard, Clock, DollarSign, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function AddMoneyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Money</h1>
        <p className="text-muted-foreground mt-1">Top up your NovaCode Labs balance</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Contact Admin to Add Funds
          </CardTitle>
          <CardDescription>To add money to your account, contact our admin on Telegram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="https://t.me/Lord_devine" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Contact @Lord_devine on Telegram
              </Link>
            </Button>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">How to add funds:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Open Telegram and search for <span className="text-foreground font-mono">@Lord_devine</span>
              </li>
              <li>Send your NovaCode Labs username</li>
              <li>Send a screenshot of your bank transfer</li>
              <li>Wait for confirmation (usually within 1 hour)</li>
              <li>Your balance will be updated automatically</li>
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Processing Time</p>
                <p className="text-xs text-muted-foreground">Usually 1 hour</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Payment Method</p>
                <p className="text-xs text-muted-foreground">Bank Transfer</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Minimum Amount</p>
                <p className="text-xs text-muted-foreground">$10.00 USD</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">How long does it take to process?</h4>
            <p className="text-sm text-muted-foreground">
              Most deposits are processed within 1 hour during business hours. If you don't receive your funds within 24
              hours, please contact support.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What payment methods are accepted?</h4>
            <p className="text-sm text-muted-foreground">
              We currently accept bank transfers. Please contact the admin for specific bank details.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Is there a minimum deposit?</h4>
            <p className="text-sm text-muted-foreground">Yes, the minimum deposit is $10.00 USD.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I get a refund?</h4>
            <p className="text-sm text-muted-foreground">
              Once funds are added to your account, they are non-refundable but can be used for any purchases on the
              platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
