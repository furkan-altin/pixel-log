import Tilt from 'react-parallax-tilt';

const HoloCardWrapper = ({ children, borderRadius = '1rem' }) => {
  return (
    <Tilt
      className="tilt-wrapper group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]"
      perspective={1000} // 3D Derinlik hissi (yüksek rakam daha az eğim)
      tiltMaxAngleX={15} // X ekseninde max eğim açısı
      tiltMaxAngleY={15} // Y ekseninde max eğim açısı
      scale={1.03} // Fareyle gelince hafif büyüme
      glareEnable={true} // Parlaklık yansımasını aç
      glareMaxOpacity={0.35} // Max parlaklık opacity'si
      glareColor="#ffffff" // Parlaklık rengi (sarımsı da yapılabilir #eab308)
      glarePosition="all" // Işığın tüm kartta dolaşmasını sağla
      glareBorderRadius={borderRadius} // Kartın köşelerine uydur
      transitionSpeed={1000} // Fare çekilince kartın düzelme hızı
    >
      <div className="inner-card w-full h-full">
        {children}
      </div>
    </Tilt>
  );
};

export default HoloCardWrapper;