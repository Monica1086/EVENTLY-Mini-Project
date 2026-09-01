import { useEffect, useState } from "react";
import axios from "axios";
import PageLogo from "../components/PageLogo";
interface TeamMember {
  name: {
    first: string;
    last: string;
  };
  picture: {
    large: string;
  };
  email: string;
}

function Teams() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const getTeam = async () => {
    try {
      const response = await axios.get(
        "https://randomuser.me/api/?results=6"
      );

      console.log("DATA TEAM:", response.data.results);

      setTeam(response.data.results);
    } catch (error) {
      console.log("ERROR MENGAMBIL DATA TEAM:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeam();
  }, []);

  return (
    <>
      <PageLogo />

      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">

          {/* JUDUL */}
          <div className="text-center">

            <h1 className="text-4xl font-bold text-red-600 sm:text-5xl">
              Tim Kami
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Kenali orang-orang yang menjadi bagian dari perjalanan
              dan pelayanan Optik Pupil.
            </p>

            <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
              *Data pada halaman ini merupakan data contoh untuk
              kebutuhan project.
            </p>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="py-20 text-center">
              <p className="text-gray-500">
                Memuat data tim...
              </p>
            </div>
          )}

          {/* TEAM */}

          {!loading && (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

              {team.map((member, index) => (
                <div
                  key={member.email}
                  className="rounded-2xl bg-white p-6 text-center shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >

                  {/* FOTO */}

                  <img
                    src={member.picture.large}
                    alt={`${member.name.first} ${member.name.last}`}
                    className="mx-auto h-32 w-32 rounded-full object-cover shadow-md"
                  />

                  {/* NAMA */}

                  <h2 className="mt-6 text-2xl font-bold text-gray-800">
                    {member.name.first} {member.name.last}
                  </h2>

                  {/* ROLE */}

                  <p className="mt-2 font-semibold text-red-600">
                    {index === 0
                      ? "Founder / Owner"
                      : index === 1
                      ? "Optician"
                      : index === 2
                      ? "Customer Service"
                      : index === 3
                      ? "Optical Staff"
                      : index === 4
                      ? "Sales Consultant"
                      : "Administration"}
                  </p>

                  {/* BIO */}

                  <p className="mt-4 leading-7 text-gray-600">
                    Berkomitmen memberikan pelayanan terbaik
                    dan membantu pelanggan mendapatkan solusi
                    penglihatan yang sesuai dengan kebutuhannya.
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Teams;