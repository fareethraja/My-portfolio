type GBLogoProps = {
    size?: "sm" | "md" | "lg";
};

export function GBLogo({ size = "md" }: GBLogoProps) {
    return (
        <span aria-hidden="true" className={`gb-logo gb-logo--${size}`}>
            <span className="gb-logo__slash" />
            <span className="gb-logo__letters">
                <span>G</span>
                <span>B</span>
            </span>
        </span>
    );
}