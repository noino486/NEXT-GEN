import Link from "next/link"
import Image from "next/image"

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Contenu sous le formulaire (lien « Créer un compte » / « Se connecter »). */
  footer: React.ReactNode
  /** Variante plus haute (inscription) : halo plus large, logo et carte plus resserrés. */
  tall?: boolean
}

/** Cadre commun des pages Connexion / Inscription : halo cyan, logo centré, carte 440px. */
export function AuthShell({ title, subtitle, children, footer, tall = false }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 pb-12">
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: tall ? -260 : -200,
          width: tall ? 900 : 700,
          height: tall ? 900 : 700,
          background: "radial-gradient(circle, rgba(0,229,255,.14) 0%, rgba(0,229,255,.04) 45%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex justify-center" style={{ paddingTop: tall ? 56 : 64 }}>
        <Link href="/" aria-label="KLYXY">
          <Image src="/klyxy.svg" alt="KLYXY" width={110} height={29} className="h-[29px] w-auto" style={{ width: "auto" }} priority />
        </Link>
      </div>

      <div className="relative z-10 flex w-full justify-center" style={{ paddingTop: tall ? 40 : 48 }}>
        <div className="flex w-full max-w-[440px] flex-col rounded-[20px] border border-white/10 bg-card p-8 sm:p-11">
          <div className="flex flex-col gap-2 pb-6">
            <h1 className="text-[25px] font-extrabold tracking-[-0.01em] text-white">{title}</h1>
            <p className="text-[13.5px] leading-normal text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="pt-6 text-center text-[13px] text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  )
}

/** Lien souligné blanc utilisé dans les pieds de carte. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-white underline underline-offset-2">
      {children}
    </Link>
  )
}

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string
  height?: number
  /** Élément placé à droite du libellé (ex. « Mot de passe oublié ? »). */
  labelAside?: React.ReactNode
  /** Élément placé à l'intérieur du champ, à droite (ex. icône œil). */
  trailing?: React.ReactNode
}

/** Champ de formulaire du design : libellé 13px, input arrondi fond #161616, anneau blanc au focus. */
export function AuthField({ label, id, height = 52, labelAside, trailing, className = "", ...props }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-white">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          style={{ height }}
          className={`w-full rounded-[14px] border-none bg-input px-4 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground disabled:opacity-60 ${
            trailing ? "pr-11" : ""
          } ${className}`}
          {...props}
        />
        {trailing && <div className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  )
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {children}
    </div>
  )
}
