export default function Footer() {
    return (
        <footer className="mt-auto bg-gray-100 border-t border-gray-50 text-sm text-gray-600">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
                <p>
                    © {new Date().getFullYear()} ALP Software. Todos os direitos
                    reservados.
                </p>
                <p className="mt-2 sm:mt-0">
                    Desenvolvido por{" "}
                    <span className="font-medium text-blue-600">
                        Equipe de TI
                    </span>
                </p>
            </div>
        </footer>
    );
}
