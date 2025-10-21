import ClimaTempo from "../../components/ClimaTempo";

export function Home() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Bem-vindo!
            </h1>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ClimaTempo />
            </div>
        </div>
    );
}
